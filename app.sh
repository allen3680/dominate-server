# 專案建置產出路徑
DISTRIBUTION="./dist"

# 版本號
VERSION=$(git rev-parse --abbrev-ref HEAD)_$(git rev-parse --short HEAD)_$(date '+%Y%m%d')

# 專案建置
build_project() {
    # 安裝全域套件
    npm i rimraf cpx uglifyjs-folder removeNPMAbsolutePaths -g

    # 移除打包的目標資料夾
    rimraf $DISTRIBUTION

    # 透過 NestJS CLI 建置專案
    nest build

    # 透過 uglifyjs-folder 混淆產出的 js 檔案
    uglifyjs-folder $DISTRIBUTION -ex .js -o $DISTRIBUTION

    # 複製 package.json, package-lock.json, ecosystem.config.js 至目標資料夾
    cpx "./{package.json,package-lock.json,ecosystem.config.js}" $DISTRIBUTION

    # 建立 version 檔案至目標資料夾
    echo $VERSION >$DISTRIBUTION/version

    # 如果有參數 pure，則不產生 node_modules
    if [ "$1" = "pure" ]; then
        return
    fi

    # 安裝專案所需套件並移除開發階段的套件
    cd $DISTRIBUTION
    npm i
    npm prune --production
    cd ..

    # 移除 node_modules 內，關於本機的相關路徑
    removeNPMAbsolutePaths $DISTRIBUTION --force --fields _where _args
}

case $1 in
build)
    # 專案建置
    build_project

    # 如果有帶 zip 參數，則進行 zip 打包，並取代 package-lock.json 內的網址
    if [ "$2" = "zip" ]; then
        #用法 sed -i '備份後綴名稱' 's/待替換的內容/替換後的內容/g' 檔案路徑
        sed -i '.bak' 's/https\:\/\/registry\.npmjs\.org/https\:\/\/nexus\.testesunbank\.com\.tw\:8443\/repository\/npm/g' $DISTRIBUTION/package-lock.json
        rm $DISTRIBUTION/package-lock.json.bak
        zip -r $VERSION $DISTRIBUTION
    fi
    ;;
*)
    echo "Usage: $0 [build|deploy]"
    echo "build       -- 建置專案"
    echo "deploy      -- 部署專案至公司環境"
    ;;
esac
