#!/bin/bash
# filepath: /media/HD-AUXILIAR/solidiy/apps/capixabay-back/src/sockets/config-sockets/capixabay-prod-porta-3001.sh

PORTA=3001

# Liberar porta
PID=$(lsof -t -i :$PORTA)
if [ -z "$PID" ]; then
    echo "Porta $PORTA já está liberada!"
else
    echo "Matando processo $PID na porta $PORTA..."
    kill -9 $PID
    echo "Porta $PORTA liberada!"
fi

# Aguarda o backend subir (healthcheck)
while ! curl -s http://localhost:$PORTA/health > /dev/null; do
    echo "Aguardando Capixabay backend subir..."
    sleep 2
done
echo "Capixabay backend pronto!"