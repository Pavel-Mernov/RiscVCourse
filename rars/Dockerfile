# Используем легковесный образ с Java 17
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY rars1_6.jar ./rars1_6.jar

ENTRYPOINT ["java", "-jar", "/app/rars1_6.jar"]