node {
    properties([
        [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', numToKeepStr: '15']]
    ])
    
    stage('Checkout') {
        checkout scm
    }
    
    stage('Yarn Build') {
        try {
            dir('client') {
                sh "yarn install"
                sh "yarn run clean"
                sh "yarn run build"
                sh "yarn run examples:build"
                sh "yarn test || true" // Ignore test failures
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

    stage('Tycho Build') {
        dir('server') {
            def mvnHome = tool 'M3'
            env.M2_HOME = "${mvnHome}"
            dir('.m2/repository/io/typefox/sprotty') { deleteDir() }
            sh "${mvnHome}/bin/mvn -f releng --batch-mode --update-snapshots -Dmaven.repo.local=.m2/repository clean install"
        }
	}
}
