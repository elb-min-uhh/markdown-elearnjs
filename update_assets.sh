#!/bin/bash

# Updates the assets/elearnjs/assets and assets/elearnjs/extensions

GLOBALDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

my_dir=`dirname $0`

# Defined local and remote paths

# arrays are: even: local path (relative from this script), odd: remote path (relative from repository root dir)

ELEARNJS_LINKS=(
    "assets/elearnjs/assets/js/min.js" "Template/assets/js/min.js"
    "assets/elearnjs/assets/js/elearn.js" "Template/assets/js/elearn.js"
    "assets/elearnjs/assets/css/elearn.css" "Template/assets/css/elearn.css"
    "assets/elearnjs/assets/css/elearn.scss" "Template/assets/css/elearn.scss"
    "assets/elearnjs/assets/img/haken.svg" "Template/assets/img/haken.svg"
    "assets/elearnjs/assets/img/logo-uhh.gif" "Template/assets/img/logo-uhh.gif"
)

FONT_LINKS=(
    "assets/elearnjs/assets/font/eLearn-Icons.woff" "Template/assets/font/eLearn-Icons.woff"
    "assets/elearnjs/assets/font/eLearn-Icons.ttf" "Template/assets/font/eLearn-Icons.ttf"
    "assets/elearnjs/assets/font/eLearn-Icons-Inkscape.svg" "Template/assets/font/eLearn-Icons-Inkscape.svg"
    "assets/elearnjs/assets/font/OpenSans-Bold-webfont.ttf" "Template/assets/font/OpenSans-Bold-webfont.ttf"
    "assets/elearnjs/assets/font/OpenSans-Bold-webfont.woff" "Template/assets/font/OpenSans-Bold-webfont.woff"
    "assets/elearnjs/assets/font/OpenSans-Italic-webfont.ttf" "Template/assets/font/OpenSans-Italic-webfont.ttf"
    "assets/elearnjs/assets/font/OpenSans-Italic-webfont.woff" "Template/assets/font/OpenSans-Italic-webfont.woff"
    "assets/elearnjs/assets/font/OpenSans-Light-webfont.ttf" "Template/assets/font/OpenSans-Light-webfont.ttf"
    "assets/elearnjs/assets/font/OpenSans-Light-webfont.woff" "Template/assets/font/OpenSans-Light-webfont.woff"
    "assets/elearnjs/assets/font/OpenSans-Regular-webfont.ttf" "Template/assets/font/OpenSans-Regular-webfont.ttf"
    "assets/elearnjs/assets/font/OpenSans-Regular-webfont.woff" "Template/assets/font/OpenSans-Regular-webfont.woff"
)

QUIZ_LINKS=(
    "assets/elearnjs/extensions/quiz/assets/js/quiz.js" "assets/js/quiz.js"
    "assets/elearnjs/extensions/quiz/assets/css/quiz.css" "assets/css/quiz.css"
    "assets/elearnjs/extensions/quiz/assets/css/quiz.scss" "assets/css/quiz.scss"
)

ELEARNVIDEO_LINKS=(
    "assets/elearnjs/extensions/elearnvideo/assets/js/elearnvideo.js" "assets/js/elearnvideo.js"
    "assets/elearnjs/extensions/elearnvideo/assets/css/elearnvideo.css" "assets/css/elearnvideo.css"
    "assets/elearnjs/extensions/elearnvideo/assets/css/elearnvideo.scss" "assets/css/elearnvideo.scss"
    "assets/elearnjs/extensions/elearnvideo/assets/font/eLearn-Video.ttf" "assets/font/eLearn-Video.ttf"
    "assets/elearnjs/extensions/elearnvideo/assets/font/eLearn-Video.woff" "assets/font/eLearn-Video.woff"
)

CLICKIMAGE_LINKS=(
    "assets/elearnjs/extensions/clickimage/assets/js/clickimage.js" "assets/js/clickimage.js"
    "assets/elearnjs/extensions/clickimage/assets/css/clickimage.css" "assets/css/clickimage.css"
    "assets/elearnjs/extensions/clickimage/assets/css/clickimage.sass" "assets/css/clickimage.sass"
)

TIMESLIDER_LINKS=(
    "assets/elearnjs/extensions/timeslider/assets/js/moment.js" "assets/js/moment.js"
    "assets/elearnjs/extensions/timeslider/assets/js/timeslider.js" "assets/js/timeslider.js"
    "assets/elearnjs/extensions/timeslider/assets/css/timeslider.css" "assets/css/timeslider.css"
    "assets/elearnjs/extensions/timeslider/assets/css/timeslider.sass" "assets/css/timeslider.sass"
)

# ------------ DEFINED UPDATE FUNCTIONS ---------------

#
# $1: repository name (e.g. "elearn.js", the dir after https://github.com/elb-min-uhh/<name>)
# $2: branch type: "master" | "develop"
function updateRepository () {
    NAME=$1
    BRANCH=$2
    LINKS=""
    case $NAME in
        elearn.js)
        LINKS=(${ELEARNJS_LINKS[*]} ${FONT_LINKS[*]})
        ;;
        quiz.js)
        LINKS=(${QUIZ_LINKS[*]})
        ;;
        elearnvideo.js)
        LINKS=(${ELEARNVIDEO_LINKS[*]})
        ;;
        clickimage.js)
        LINKS=(${CLICKIMAGE_LINKS[*]})
        if [ "$BRANCH" = "develop" ]; then BRANCH="development"; fi;
        ;;
        timeslider.js)
        LINKS=(${TIMESLIDER_LINKS[*]})
        if [ "$BRANCH" = "develop" ]; then BRANCH="development"; fi;
        ;;
    esac

    echo "Update ${NAME} from ${BRANCH}."

    for (( ix=0; ix<${#LINKS[*]}; ix=ix+2 ))
    do
        ix2=ix+1
        LOCAL="${GLOBALDIR}/${LINKS[ix]}"
        REMOTE="https://raw.githubusercontent.com/elb-min-uhh/${NAME}/${BRANCH}/${LINKS[$ix2]}"
        updateFile $LOCAL $REMOTE
    done
}

# Takes two arguments:
# $1: local link, the output file name (absolute path)
# $2: remote link, the download URL (full URL)
#
function updateFile () {
    curl --create-dirs -s -o $1 $2
}

# ------------ RUN ACTUAL SCRIPT -------------

# -- PARSE ARGUMENTS
POSITIONAL=()

BRANCH="master"
REPOSITORY="all"

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -b|--branch)
    BRANCH="$2"
    shift # past argument
    shift # past value
    ;;
    -r|--repository)
    REPOSITORY="$2"
    shift # past argument
    shift # past value
    ;;
    -h|--help)
    echo "Usage: $0 [options]"
    echo "-b, --branch <branch>: optional branch selection"
    echo "-r, --repository <repo>: select only one specific repository"
    exit
    shift # past argument
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters
# -- END PARSE ARGUMENTS


# Update Repos
if [ "$REPOSITORY" = "all" ];
then
    echo "Updating all repos from ${BRANCH}."
    updateRepository "elearn.js" $BRANCH
    updateRepository "quiz.js" $BRANCH
    updateRepository "elearnvideo.js" $BRANCH
    updateRepository "clickimage.js" $BRANCH
    updateRepository "timeslider.js" $BRANCH
# use given version
else
    # TODO
    updateRepository $REPOSITORY $BRANCH
fi

echo "Done."
