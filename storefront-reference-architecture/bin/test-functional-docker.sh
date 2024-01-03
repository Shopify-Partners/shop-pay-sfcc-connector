#!/usr/bin/env bash

HUB_RUNNING=$(docker inspect --format="{{ .State.Running }}" selenium-hub 2> /dev/null)

if [ $? -eq 1 ]; then
    echo "Selenium Hub does not exist. Attempting to run it..."
    docker run -d -p 4444:4444 --name selenium-hub --restart always selenium/hub:2.53.0
    sleep 2
fi

if [ "$HUB_RUNNING" == "false" ]; then
    echo "Selenium Hub is not running. Attempting to start it..."
    docker start selenium-hub
    sleep 2
fi


CONTAINER_NAME="sg-functional-test-chrome-$JOB_NAME"
# remove any pre-existing container
if [ $(docker ps -a | grep $CONTAINER_NAME | awk '{print $NF}' | wc -l) -gt 0 ]; then
    docker rm -f $CONTAINER_NAME 1>/dev/null
fi

# if a debug flag is passed in, use the debug image and open vnc screen sharing
if [[ $@ == *"--debug"* ]]; then
    ip=$(grep -Eo '([0-9]{1,3}\.){3}[0-9]{1,3}' <<< "$@")
    docker run -d --link selenium-hub:hub --name $CONTAINER_NAME -p 5900:5900 -v /dev/shm:/dev/shm selenium/node-chrome-debug:2.53.0 1>/dev/null
    sleep 2 # wait a bit for container to start
    open vnc://:secret@"$ip":5900
else
    docker run -d --link selenium-hub:hub --name $CONTAINER_NAME -v /dev/shm:/dev/shm selenium/node-chrome:2.53.0 1>/dev/null
    sleep 2
fi

# run actual test command in a subshell to be able to rm docker container afterwards
# this command is for Jenkins job to by pass the Makefile.js
(
    ./node_modules/.bin/wdio test/functional/webdriver/wdio.conf.js "$@" 2> /dev/null
)

# save exit code of subshell
testresult=$?

docker stop $CONTAINER_NAME 1>/dev/null && docker rm $CONTAINER_NAME 1>/dev/null

exit $testresult
