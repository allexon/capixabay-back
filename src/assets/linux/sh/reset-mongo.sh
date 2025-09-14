#!/bin/bash

echo "Corrigindo permissões do diretório de dados do MongoDB..."
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chmod 700 /var/lib/mongodb

echo "Corrigindo permissões do diretório /tmp..."
sudo chmod 1777 /tmp

echo "Removendo arquivo de socket travado (se existir)..."
sudo rm -f /tmp/mongodb-27017.sock

echo "Reiniciando serviço do MongoDB..."
sudo systemctl restart mongod

echo "Verificando status do MongoDB..."
sudo systemctl status mongod

echo "Pronto! Se aparecer 'active (running)', o MongoDB está OK."