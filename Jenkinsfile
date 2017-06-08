node {
    properties([
        [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', numToKeepStr: '15']]
    ])
    
    stage 'Checkout'
    checkout scm
    
    stage 'Gradle Build'
    dir('server') {
        sh "./gradlew clean build createLocalMavenRepo --refresh-dependencies --continue"
    }
    
    archive 'build/**'
}
