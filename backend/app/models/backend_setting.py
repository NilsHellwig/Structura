from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class BackendSetting(Base):
    __tablename__ = "backend_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    backend = Column(String, nullable=False)  # 'openai', 'ollama', 'vllm'
    base_url = Column(String, nullable=True)
    api_key = Column(String, nullable=True)

    # Relationships
    user = relationship("User", backref="backend_settings")

    __table_args__ = (
        UniqueConstraint("user_id", "backend", name="uq_user_backend_settings"),
    )
