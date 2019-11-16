FROM terrillo/python3flask:latest

ENV STATIC_URL /static
ENV STATIC_PATH /frontend/static

# Place your flask application on the server
COPY ./frontend /frontend
WORKDIR /frontend

# Install requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# NGINX setup
COPY ./frontend/nginx.sh /frontend/nginx.sh
RUN chmod +x /frontend/nginx.sh

ENV PYTHONPATH=/frontend

ENTRYPOINT ["/frontend/nginx.sh"]

# Start Server
CMD ["/start.sh"]

EXPOSE 80 443
