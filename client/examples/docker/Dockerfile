# This file configures a docker container which serves the example pages of sprotty

FROM openjdk:8-jdk

USER root

RUN curl -sL  https://deb.nodesource.com/setup_8.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

#RUN apt-get update
RUN apt-get install -y nodejs yarn

RUN nodejs --version

RUN npm --version

RUN git --version

RUN useradd -m sprotty

USER sprotty
WORKDIR /home/sprotty

RUN git clone -b docker https://github.com/theia-ide/sprotty.git

RUN cd sprotty/client && yarn && yarn examples:build

RUN cd sprotty/server && ./gradlew build

EXPOSE 8080

CMD cd sprotty/server && ./gradlew jettyRun

