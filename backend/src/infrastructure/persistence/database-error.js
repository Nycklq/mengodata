const descriptions = {
  28000: [
    'DATABASE_AUTHORIZATION_REJECTED',
    'O PostgreSQL recusou a autorização. Verifique LOGIN da role e as regras de autenticação.',
  ],
  '28P01': [
    'DATABASE_AUTHENTICATION_FAILED',
    'O PostgreSQL recusou as credenciais da conexão.',
  ],
  '3D000': [
    'DATABASE_NOT_FOUND',
    'O banco configurado não existe no servidor informado.',
  ],
  '3F000': [
    'DATABASE_SCHEMA_NOT_FOUND',
    'O schema necessário não existe no banco configurado.',
  ],
  '42P01': [
    'DATABASE_RELATION_NOT_FOUND',
    'Uma tabela ou view necessária não existe no banco configurado.',
  ],
  42703: [
    'DATABASE_COLUMN_NOT_FOUND',
    'O schema do banco não contém uma coluna exigida pela importação.',
  ],
  42501: [
    'DATABASE_PERMISSION_DENIED',
    'A role não possui as permissões necessárias no banco configurado.',
  ],
  23505: [
    'DATABASE_UNIQUE_CONFLICT',
    'A importação encontrou conflito com uma chave única existente.',
  ],
  23514: [
    'DATABASE_CONSTRAINT_VIOLATION',
    'Os dados não atendem a uma restrição do schema existente.',
  ],
  ECONNREFUSED: [
    'DATABASE_CONNECTION_REFUSED',
    'O servidor recusou a conexão no endereço configurado.',
  ],
  ETIMEDOUT: ['DATABASE_CONNECTION_TIMEOUT', 'A conexão excedeu o tempo de espera.'],
  ENOTFOUND: ['DATABASE_HOST_NOT_FOUND', 'O endereço do servidor não foi encontrado.'],
};

export function describeDatabaseError(error) {
  const description = Object.hasOwn(descriptions, error?.code)
    ? descriptions[error.code]
    : null;
  return description
    ? {
        code: description[0],
        sqlstate: /^[0-9A-Z]{5}$/.test(error.code) ? error.code : null,
        message: description[1],
      }
    : {
        code: 'DATABASE_OPERATION_FAILED',
        sqlstate: null,
        message:
          'Falha na operação. Confira a configuração e o schema do banco selecionado.',
      };
}
