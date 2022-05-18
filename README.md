
# Telegram bot по обработке MR

В этом проекте вы познакомитесь с решением проблемы связанные с MR.



## 🛠 Приложение

В этом приложении у нас стояла задача сделать удобного Telegram бота, 
который будет обрабатывать MR. В ходе ра/Users/aleksandrbelous/Downloads/README.mdзработки были сделаны следущие функции: 

#### ✅ Отправка MR нескольким пользователям 

#### ✅ Просмотр статуса MR 

#### ✅ Завершение, отправка замечаний и их исправление

#### ✅ Кому и от кого отправлен MR 

#### ✅ Дата отправки MR 

#### ✅ Просмотр отправленных MR 

#### ✅ Просмотр  полученных MR


## 💻  Технологии
🍕 Node.js , 🐳 Docker , 🐘 PostgreSQL

#### Библиотеки: 

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)

- [pg](https://github.com/brianc/node-postgres)


## ⚙️ Инструкция по запуску

Необходимо создать файл .env и внести следущие значения:


 - token= Ваш токен
 - user=root
 - password=root
 - database=postgres
 - host=db
 - port=5432

#### Запустим Docker контейнер:

docker run --name db -p 5400:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -d postgres

db - имя контейнера бд

#### Полную инструкцию по запуску можно посмотреть по ссылке:

- [MRBot](https://drive.google.com/drive/folders/1jLytO94GoG5k7xHLQ4pq2MnFOupGuhyL?usp=sharing)
