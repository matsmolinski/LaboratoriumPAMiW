FROM terrillo/python3flask:latest

ENV STATIC_URL /static
ENV STATIC_PATH /backend/static

# Place your flask application on the server
COPY ./backend /backend
WORKDIR /backend

# Install requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt


ENTRYPOINT ["python"]

# Start Server
CMD ["main.py"]
