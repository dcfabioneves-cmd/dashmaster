# --- MODELOS (Tabelas) ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    spreadsheet_url = Column(String)
    categories = Column(JSON) # Armazena array de strings como JSON
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="projects")

# Cria as tabelas no banco de dados
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependência para pegar a sessão do DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
