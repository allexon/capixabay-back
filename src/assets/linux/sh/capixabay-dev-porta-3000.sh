#!/bin/bash
# filepath: /media/HD-AUXILIAR/solidiy/apps/capixabay-back/src/sockets/config-sockets/capixabay-dev-porta-3000.sh

PORTA=3000

# Liberar porta
PID=$(lsof -t -i :$PORTA)
if [ -z "$PID" ]; then
    echo "Porta $PORTA já está liberada!"
else
    echo "Matando processo $PID na porta $PORTA..."
    kill -9 $PID
    echo "Porta $PORTA liberada!"
fi

# Sobe o backend em dev com PM2
DIR_BACK="/media/HD-AUXILIAR/solidiy/apps/capixabay-back"
cd $DIR_BACK
pm2 start src/Server.ts --watch

# Aguarda o backend subir (healthcheck)
while ! curl -s http://localhost:$PORTA/health > /dev/null; do
    echo "Aguardando Capixabay backend subir..."
    sleep 2
done
echo "Capixabay backend pronto!"