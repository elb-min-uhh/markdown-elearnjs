node {

    currentBuild.result = "SUCCESS"

    try{
        // preparation
        stage('Build') {
            try {
                checkout scm
                sh "npm install"
                sh "npm run compile"
                if(currentBuild.result != "SUCCESS") throw new Exception();
            }
            catch(err) {
                currentBuild.result = "FAILED"
                throw err // to force stop
            }
        }

        stage('Test') {
            try {
                // assert build in 'Build' succeeded
                sh '''#!/bin/bash
                shopt -s globstar
                nyc mocha --recursive --require ts-node/register -u tdd --reporter xunit --reporter-options output=./test-report.xml --reporter spec --retries 1 src/test/**/*.test.ts
                '''
                if(currentBuild.result != "SUCCESS") throw new Exception();
            }
            catch(err) {
                currentBuild.result = "UNSTABLE"
                throw err // to force stop
            }
        }

        stage('Publish Tests') {
            junit allowEmptyResults: true, testResults: 'test-report.xml'
            publishHTML([alwaysLinkToLastBuild: true, keepAll: false, reportDir: 'coverage/lcov-report/', reportFiles: 'index.html', reportName: 'Code Coverage', reportTitles: 'Code Coverage']);
        }
    }
    catch(err) {
        // jump out of failing stages
    }
}