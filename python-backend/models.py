from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, Enum):
    COMPANY = "company"
    SUPPLIER = "supplier" 
    NGO = "ngo"
    ADMIN = "admin"

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    BIDDING = "bidding"
    AWARDED = "awarded"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)  # UserRole enum
    company_name = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="company")
    bids = relationship("Bid", back_populates="supplier")
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="Message.recipient_id", back_populates="recipient")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    budget = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    location = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(String, default=ProjectStatus.DRAFT)
    company_id = Column(String, ForeignKey("users.id"), nullable=False)
    awarded_bid_id = Column(String, ForeignKey("bids.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("User", back_populates="projects")
    bids = relationship("Bid", back_populates="project")
    messages = relationship("Message", back_populates="project")
    documents = relationship("Document", back_populates="project")

class Bid(Base):
    __tablename__ = "bids"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    supplier_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    delivery_time = Column(Integer, nullable=False)  # days
    message = Column(Text, nullable=True)
    attachments = Column(Text, nullable=True)  # JSON array of file URLs
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="bids")
    supplier = relationship("User", back_populates="bids")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(String, ForeignKey("users.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    content = Column(Text, nullable=False)
    message_type = Column(String, default="text")  # text, file, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="messages_received")
    project = relationship("Project", back_populates="messages")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    url = Column(String, nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    category = Column(String, nullable=False)  # contract, invoice, certificate, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    uploader = relationship("User")
    project = relationship("Project", back_populates="documents")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    payer_id = Column(String, ForeignKey("users.id"), nullable=False)
    payee_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    status = Column(String, default="pending")  # pending, completed, failed, refunded
    payment_method = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    webhook_processed = Column(Boolean, default=False)
    audit_trail = Column(Text, nullable=True)  # JSON log of status changes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")
    payer = relationship("User", foreign_keys=[payer_id])
    payee = relationship("User", foreign_keys=[payee_id])