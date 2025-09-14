1. chmod +x /media/HD-AUXILIAR/solidiy/apps/capixabay-back/src/sockets/config-sockets/capixabay-*.sh
2. npm install -g pm2
3. sudo apt update && sudo apt install net-tools

--- RODAR PROJETO EM DEV (porta 3000) ---
4. ./src/sockets/config-sockets/capixabay-dev-porta-3000.sh
5. pm2 list
6. pm2 logs

--- RODAR PROJETO EM PRODUÇÃO (porta 3001) ---
7. sudo cp ./src/sockets/config-sockets/capixabay-prod-porta-3001.service /etc/systemd/system/
8. sudo systemctl daemon-reload
9. sudo systemctl enable capixabay-prod-porta-3001
10. sudo systemctl start capixabay-prod-porta-3001
11. sudo systemctl status capixabay-prod-porta-3001
12. sudo systemctl stop capixabay-prod-porta-3001

--- ADMIN PM2 / EXECUÇÃO MANUAL ---
12. pm2 stop all
13. pm2 delete all
14. npm run dev
15. npm run build && npm start

--- GERENCIAR PORTA ---
17. lsof -i :3000
18. lsof -i :3001
19. ss -tulnp | grep 3000
20. ss -tulnp | grep 3001

Obs:  
- Use sempre o script correspondente à porta/ambiente.
- Não rode dev e prod ao mesmo tempo na mesma porta.
- O arquivo .service deve ficar em /etc/systemd/system/