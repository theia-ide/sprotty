node {
    properties([
        [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', numToKeepStr: '15']]
    ])
    
    stage('Checkout') {
        checkout scm
    }
    
    stage('npm Build') {
        try {
            dir('client') {
                sh "npm install"
                sh "npm run clean"
                sh "npm run build"
                sh "npm run examples:build"
                sh "npm test || true" // Ignore test failures
            }
        } finally {
            step([$class: 'JUnitResultArchiver', testResults: 'client/artifacts/test/xunit.xml'])
            archive 'client/artifacts/coverage/**'
        }
    }
    
    stage('Gradle Build') {
        try {
            dir('server') {
                sh "./gradlew clean build createLocalMavenRepo -PignoreTestFailures=true --refresh-dependencies --continue"
            }
        } finally {
            step([$class: 'JUnitResultArchiver', testResults: 'server/**/build/test-results/test/*.xml'])
            archive 'server/build/maven-repository/**'
        }
    }
}
