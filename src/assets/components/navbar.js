import React from 'react';
import { Navbar, Button, Nav } from 'react-bootstrap';

function SignOut(props) {
    return props.auth.currentUser && (
      <Button onClick={() => props.auth.signOut()} variant="outline-light">Sign Out</Button>
    )
  }

function myNavbar(props) {
    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand>SHITHEAD TRACKER</Navbar.Brand>
            <Nav className="ml-auto">
                <SignOut auth={props.auth} />
            </Nav>
        </Navbar>
    )
}

export default myNavbar