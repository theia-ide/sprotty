node {
    properties([
        [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', numToKeepStr: '15']]
    ])
    
    stage 'Checkout'
    checkout scm
    
    stage 'npm Build'
    dir('client') {
        sh "npm install"
        sh "npm run build"
        sh "npm run examples:build"
        sh "npm test"
    }
    step([$class: 'JUnitResultArchiver', testResults: 'client/artifacts/test/xunit.xml'])
    archive 'client/artifacts/coverage/**'
    
    stage 'Gradle Build'
    dir('server') {
        sh "./gradlew clean build createLocalMavenRepo --refresh-dependencies --continue"
    }
    archive 'server/build/maven-repository/**'
}
