# syntax=docker/dockerfile:1

# ---- build: compile and package the Spring Boot jar ----
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
# Download dependencies first so they're cached between source changes.
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src src
# Tests need Docker (Testcontainers); run them with ./mvnw test outside the image build.
RUN ./mvnw -B -q package -DskipTests && cp target/backend-*.jar app.jar

# ---- run: JRE only ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S -g 1001 spring && adduser -S -u 1001 -G spring spring
ENV UPLOAD_DIR=/app/uploads
COPY --from=build --chown=spring:spring /app/app.jar app.jar
# Upload storage (a volume in docker-compose.yml); must be writable by the non-root user.
RUN mkdir -p /app/uploads && chown spring:spring /app/uploads
USER spring
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/actuator/health/readiness || exit 1
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
