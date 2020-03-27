SELECT moniker
FROM team
WHERE league IN ('{league}')
ORDER BY moniker ASC;
