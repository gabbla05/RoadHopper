# Sprawozdanie — Zadanie 4: Zmiana perspektywy

## Wprowadzone zmiany

Zmieniono rzut ukośny w shaderze wierzchołków `src/shaders/vertexShader.js`.
Nie dodawano geometrii ani nie zmieniano położeń obiektów. Zmieniono sposób
przeliczania współrzędnych sceny na ekran:

| Oś | Przed | Po |
| --- | --- | --- |
| Pozioma | `screenX = x - z * 0.35` | `screenX = x + z * 0.20` |
| Pionowa | `screenY = y + z * 0.22 + 0.15` | `screenY = y + z * 0.10 + 0.15` |
| Głębia | `depth = z * 0.20 - y * 0.05` | bez zmian |

## Porównanie widoku

| Przed modyfikacją | Po modyfikacji |
| --- | --- |
| Oś Z przesuwała obiekty w lewo i silniej w pionie w miarę oddalania. | Kierunek poziomego ukosu osi Z jest odwrócony, a jej pochylenie pionowe jest łagodniejsze. |
| Czerwone drzewo na pasie `z: -0.70` nakładało się koroną na samochody na drodze. | Korona drzewa znajduje się wyżej względem samochodów; samochody i drzewa pozostają rozpoznawalne w kadrze. |
| Poziome przesunięcie zależne od Z wynosiło `-0.35`. | Poziome przesunięcie zależne od Z wynosi `+0.20`, co zmienia również kierunek ukosu. |

Zachowano dotychczasowy bufor głębi oraz korektę proporcji obrazu, dzięki czemu
kolejność zasłaniania obiektów pozostała zgodna z istniejącą sceną. Wszystkie
cztery pasy planszy oraz obiekty sceny mieszczą się w kadrze przy standardowym
układzie strony.
