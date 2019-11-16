FROM terrillo/python3flask:latest

ENV STATIC_URL /static
ENV STATIC_PATH /backend/static

# Place your flask application on the server
COPY ./backend /backend
WORKDIR /backend

# Install requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# NGINX setup
COPY ./backend/nginx.sh /backend/nginx.sh
RUN chmod +x /backend/nginx.sh

ENV PYTHONPATH=/backend

ENTRYPOINT ["/backend/nginx.sh"]

# Start Server
CMD ["/start.sh"]

EXPOSE 80 443
