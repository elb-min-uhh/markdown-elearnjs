node {

    currentBuild.result = "SUCCESS"

    // preparation
    stage('Build') {
        try {
            checkout scm
            sh "npm install"
            sh "npm run compile"
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
            nyc mocha --recursive --require ts-node/register -u tdd --reporter xunit --reporter-options output=./test-report.xml --retries 1 src/test/**/*.test.ts
            '''
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
