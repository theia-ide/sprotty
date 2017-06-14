# This file configures a docker container which serves the example pages of sprotty

FROM openjdk:8-jdk

USER root

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get install -y nodejs

RUN nodejs --version

RUN npm --version

RUN git --version

RUN useradd -m sprotty

USER sprotty
WORKDIR /home/sprotty

RUN git clone -b docker https://github.com/theia-ide/sprotty.git

RUN cd sprotty/client && npm install && npm run examples:build

RUN cd sprotty/server && ./gradlew build

EXPOSE 8080

CMD cd sprotty/server && ./gradlew jettyRun

