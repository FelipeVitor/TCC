from sqlalchemy.types import TypeDecorator, CHAR
import uuid


# Tipo personalizado para UUID com SQLAlchemy e SQLite
class BaseUUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses
    CHAR(36), storing as stringified standard UUID values.
    """

    impl = CHAR
    cache_ok = True  # Define como True para permitir uso seguro em cache

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(uuid.UUID())
        else:
            return dialect.type_descriptor(
                CHAR(36)
            )  # Usamos CHAR(36) para strings padrão de UUID

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        try:
            # Garante que o valor seja um objeto UUID antes de converter para string
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(str(value))
            return str(value)  # Retorna como string padrão de UUID
        except ValueError as e:
            raise ValueError(
                f"Valor '{value}' não é um UUID válido."
            )  # Erro amigável para casos inválidos

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(value)  # Converte a string de volta para um objeto UUID
