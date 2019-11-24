# LaboratoriumPAMiW

## Uruchomienie dockera

Wystarczy wejść do katalogu LaboratoriumPAMiW oraz wpisać polecenia:

docker-compose build
docker-compose up

Nie udało się uruchomić na heroku.

## Przejście do formularza

Adres http://localhost:3000 to formularz rejestracji.
http://localhost:3000/login to logowanie, można się też dostać przez link z pierwszego formularza.
http://localhost:3000/cloud - zbiór pdfów.
login przekierowuje do cloud, jeśli użytkownik ma aktywną sesję. Cloud nie pozwala na pobranie pliku bez jwt token. Miał także przekierowywać na login przy nieaktywnej sesji, ale dla testowania jwt zrezygnowałem z tej funkcji.

Można sprawdzać bazę redis przez docker exec -it redis redis-cli


