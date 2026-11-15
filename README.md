# Subway Hub

**Subway Hub Alpha 0.1** é o começo de uma plataforma de endless runner independente, feita para navegador em celular e PC.

> Este projeto usa personagens, cenários e código originais. Não inclui arquivos, músicas, mapas ou marcas registradas de Subway Surfers. Qualquer integração com o jogo original exigiria autorização dos titulares.

## O que já funciona
- Corrida jogável no navegador com três faixas, obstáculos, moedas, pulo e deslize.
- Controles por teclado, botões e gestos de toque.
- Três cenários originais selecionáveis.
- Modo de corrida e modo de treinamento (mesma pista nesta primeira versão).
- Recorde e moedas salvos localmente no navegador.
- Envio local de imagens para experimentar texturas e ícone de moeda (ainda não aplicados aos modelos 3D/personagem).

## Rodar localmente
Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Publicação
O workflow em `.github/workflows/deploy.yml` publica automaticamente o site no GitHub Pages quando há push na branch `main`. Ative **Settings → Pages → Build and deployment → GitHub Actions** no repositório.

## Próximas etapas
1. Melhorar o motor de jogo e transformar os cenários em mapas completos.
2. Aplicar imagens importadas ao personagem/moedas com validação de tamanho e formato.
3. Criar um formato de pacote de mods seguro, sem executar scripts enviados por usuários.
4. Criar contas, ranking e multiplayer com backend dedicado e regras de segurança.
5. Adicionar mapas e personagens originais ou licenciados.

## Segurança e privacidade
Nesta versão, personalizações, moedas e recordes ficam no armazenamento local do navegador. Não há contas, uploads para servidor ou multiplayer ativo. Não envie informações pessoais em arquivos de mods.