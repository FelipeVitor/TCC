build-push:
	@docker build -t ghcr.io/felipevitor/tcc-backend-api:latest ./backend/
	@docker build --build-arg REACT_APP_API_URL=http://198.7.113.9:9000/ -t ghcr.io/felipevitor/tcc-frontend:latest ./frontend/
	@docker push ghcr.io/felipevitor/tcc-backend-api:latest
	@docker push ghcr.io/felipevitor/tcc-frontend:latest
	