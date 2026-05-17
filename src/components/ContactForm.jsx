import React, { useState, useEffect } from 'react';
import { useForm } from '@formspree/react';

function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [state, handleSubmit] = useForm(import.meta.env.VITE_FORMSPREE_FORM_ID || "movpveel");

  // Efeito para buscar o email salvo no localStorage (Mantido)
  useEffect(() => {
    const savedEmail = localStorage.getItem('contactEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (state.succeeded) {
      // Limpa a mensagem após o envio bem-sucedido
      setMessage(''); 
      // Salva o email no localStorage
      localStorage.setItem('contactEmail', email); 
    }
  }, [state.succeeded, email]); // Depende do sucesso e do email

  const hasError = state.errors && state.errors.length > 0;

  if (state.succeeded && !hasError) {
    return (
      <div className="contact-form-container">
        <h3>Contact the Developer</h3>
        <p className="comment-message success">
          Message sent successfully! The developer will reply as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <div className="contact-form-container">
        <h3>Contact the Developer</h3>
        <p>Send your message directly to the developer. A reply will be sent to the provided email as soon as possible.</p>

      <form onSubmit={handleSubmit} className="contact-form">
        
        {hasError && (
            <p className="comment-message error">
                Failed to send your message. Please try again.
            </p>
        )}

        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state.submitting} 
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Your Message</label>
          <textarea
            id="message"
            name="message" 
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={state.submitting} 
            required
          ></textarea>
        </div>
        <button type="submit" className="button-primary" disabled={state.submitting}>
          {state.submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;