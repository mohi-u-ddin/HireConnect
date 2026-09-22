package com.mohiuddin.HireConnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class HireConnectApplication {

	public static void main(String[] args) {
		loadDotenvIfPresent();
		SpringApplication.run(HireConnectApplication.class, args);
	}
	public static void loadDotenvIfPresent() {
		try {
			Path[] candidatePaths = new Path[]{
					Paths.get(".env"),
					Paths.get("HireConnect_Backend", ".env"),
					Paths.get("..", ".env")
			};

			for (Path path : candidatePaths) {
				if (Files.exists(path) && !Files.isDirectory(path)) {
					List<String> lines = Files.readAllLines(path);
					for (String rawLine : lines) {
						String line = rawLine.trim();
						if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
							continue;
						}
						int eqIdx = line.indexOf('=');
						String key = line.substring(0, eqIdx).trim();
						String value = line.substring(eqIdx + 1).trim();
						if ((value.startsWith("\"") && value.endsWith("\"")) ||
								(value.startsWith("'") && value.endsWith("'"))) {
							value = value.substring(1, value.length() - 1);
						}
						if (System.getProperty(key) == null && System.getenv(key) == null) {
							System.setProperty(key, value);
						}
					}
					break;
				}
			}
		} catch (Exception ignored) {
		}
	}

}
