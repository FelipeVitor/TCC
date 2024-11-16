from abc import ABC, abstractmethod

from sqlalchemy.orm import Session


class IRepository(ABC):
    db: Session
    tx: Session
    commit_tx: bool = False

    def commit(self):
        self.commit_tx = True
        self.tx.commit()

    def __enter__(self):
        self.tx = self.db.begin()
        self.commit_tx = False
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if not self.commit_tx:
            self.tx.rollback()
        else:
            self.tx.commit()
