#!/bin/sh

REPO=https://github.tools.digital.engie.com/KP6215/app-proxy.git

DIR_DEV=AZDMPA001APS001
URL_DEV=https://dmpa-dev4@azdmpa001aps001.scm.azurewebsites.net:443/AZDMPA001APS001.git

read -p "Enter the branch you want to deliver (e.g. develop, feature/DDB-300, release/2.0.0) : " branch
BRANCH=${branch}

# read -p "To what environment do wou want it delivered ? : " env
PS3='To what environment do you want it delivered ? '
options=("DEV" "Quit")

select opt in "${options[@]}"; do
    case $opt in
        "DEV")
            echo "you chose Development (DEV)" 
            ENV=DEV
            DIR=${DIR_DEV}
            URL=${URL_DEV}
            break 
            ;;
        "Quit")
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done

if [ -n "${ENV}" ] && [ -n "${BRANCH}" ]; then
    echo "Delivering ${BRANCH} to ${ENV}. Please wait..."
    echo "--------------- BEGIN DELIVERY ---------------"
    echo "--- Remove old repo ..."
    rm -Rf ${DIR} 
    echo "--- Clone Azure repo ..."
    git clone ${URL}
    cd ${DIR}
    echo "--- Fetch github repo ..."
    git remote add source ${REPO}
    git fetch source
    echo "--- Push branch to azure repo ..."
    git push origin +refs/remotes/source/${BRANCH}:refs/heads/master
    echo "--- Remove repo ..."
    rm -Rf ../${DIR}
    echo "--------------- END DELIVERY ---------------"
fi