#!/bin/bash
INPUT=$(cat)
CMD=$(echo "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const o=JSON.parse(d);process.stdout.write(o?.tool_input?.command||'')}catch{}})")

# Only act on git push commands
if ! echo "$CMD" | grep -q '^git push'; then
  exit 0
fi

echo "Rodando build antes do push..."
cd /c/github/ensaio-eletrico-web || exit 0

if npm run build 2>&1; then
  echo "Build OK — push liberado."
else
  printf '{"continue":false,"stopReason":"Build falhou — corrija os erros de TypeScript antes do push."}\n'
fi
