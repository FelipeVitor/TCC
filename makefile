build-push:
	@docker build -t ghcr.io/felipevitor/tcc-backend-api:latest ./backend/
	@docker build -t ghcr.io/felipevitor/tcc-frontend:latest ./frontend/
	@docker push ghcr.io/felipevitor/tcc-backend-api:latest
	@docker push ghcr.io/felipevitor/tcc-frontend:latest