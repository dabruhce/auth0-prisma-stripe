````db

docker ps
docker exec -it 72a147f95be7 mysql -u root --host 127.0.0.1 --port 3306 --password=prisma
show databases;
use my-app@dev
show tables;
SELECT * FROM Chat;
DELETE FROM Chat;

````


````text
docker-compose up -d
prisma deploy
prisma generate
prisma seed
yarn install
yarn start

````
