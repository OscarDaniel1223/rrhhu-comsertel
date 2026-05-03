import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

export default function Modal_default({ show, onHide, title, children }) {
    return (


        <Modal dialogClassName="modal-top" size="lg" backdrop="static" keyboard={false} show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>{children}</Modal.Body>
        </Modal>

    );
}