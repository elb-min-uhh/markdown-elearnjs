node {

    currentBuild.result = "SUCCESS"

    try{
        // preparation
        stage('Build') {
            try {
                checkout scm
                sh "npm install"
                // remove bundled chromium to use `chromium-browser` in CI
                sh "rm -r node_modules/puppeteer/.local-chromium/"
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
                sh "npm run testXUnit"
                if(currentBuild.result != "SUCCESS") throw new Exception();
            }
            catch(err) {
                currentBuild.result = "UNSTABLE"
                throw err // to force stop
            }
        }

        stage('Publish') {
            sh "npm run createDocs" // create documentation
            publishHTML([alwaysLinkToLastBuild: true, keepAll: false, reportDir: 'docs/', reportFiles: 'index.html', reportName: 'Documentation', reportTitles: 'Documentation']);
            sh "touch test-report.xml" // update timestamp
            junit allowEmptyResults: true, testResults: 'test-report.xml'
            publishHTML([alwaysLinkToLastBuild: true, keepAll: false, reportDir: 'coverage/lcov-report/', reportFiles: 'index.html', reportName: 'Code Coverage', reportTitles: 'Code Coverage']);
        }
    }
    // when jump is FAILED or UNSTABLE
    catch(err) {
        try {
            def defaultRecipient = '$DEFAULT_RECIPIENTS'
            def comitter = sh (
                script: 'git --no-pager show -s --format=\'%ae\'',
                returnStdout: true
            ).trim()

            def jobName = currentBuild.fullDisplayName

            emailext body: '''${SCRIPT, template="groovy-html.template"}''',
                mimeType: 'text/html',
                subject: "[Jenkins] ${jobName}",
                to: "${comitter}, ${defaultRecipient}"
        }
        catch(innerErr) {
            // ignore email send errors
        }
    }
}
