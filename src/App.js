import React from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { Form, Button, Image, Collapse, Card } from 'react-bootstrap';
import Navbar from './assets/components/navbar'

import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();


firebase.initializeApp({

})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  const boardRef = firestore.collection('shithead');
  const query = boardRef.orderBy('shitheads', "desc");
  const [board] = useCollectionData(query, {idField: 'uid'});

  var data;
  const userQuery = firestore.collection('users').orderBy('displayName');
  const [users] = useCollectionData(userQuery, {idField: 'uid'})
  if (users) {
    data = users.map(user => ({value: user.uid, label: user.displayName}));
  }

  return (
    <div className="App">
      <header>
        {user ? <Navbar auth={auth}/> : null}
      </header>
      {user ? <div className="container"><NewGameForm data={data} /><Leaderboard board={board}/></div> : <div className="container"><SignIn /></div>}
    </div>
  );
}

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: []
    }
  }

  addUser() {
    const user = firebase.auth().currentUser;
    const users = firestore.collection('users').doc(user.uid);
    users.set({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email
    }, {merge: true});
  }
  
  render() {
    const signInWithGoogle = async () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      if (firebase.auth().currentUser.metadata.creationTime === firebase.auth().currentUser.metadata.lastSignInTime) {
        this.addUser();
      }
    }

    return (
      <div className="row max-height">
        <div className="my-auto mx-auto text-center">
          <h1>SHITHEAD TRACKER</h1>
          <Image src={require("./assets/img/cards.jpg")} width="150" />
          <h2 className="py-3 h3 font-weight-normal">Please sign in</h2>
          <Button size="lg" onClick={signInWithGoogle}>Sign in with Google</Button>
        </div>
      </div>
    )
  }
}

function Leaderboard(props) {
  return (
    <div className="row">
        <h1>Leaderboard</h1>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Shitheads</th>
              <th scope="col">Games Played</th>
              <th scope="col">% Shithead</th>
            </tr>
          </thead>
          <tbody>
          {props.board && props.board.map(entry => 
            <tr key={entry.uid}>
              <th scope="row">{props.board.indexOf(entry) + 1}</th>
              <th scope="row">{entry.name}</th>
              <th scope="row">{entry.shitheads}</th>
              <th scope="row">{entry.gamesPlayed}</th>
              <th scope="row">{(entry.shitheads / entry.gamesPlayed) * 100}</th>
            </tr>
          )}
          </tbody>
        </table>
      </div>
  )
}

class NewGameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: '',
      loser: '',
      open: false,
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    this.state.players.forEach(player => {
      const loser = this.state.loser;

      if (player.value) {
        var playerRef = firestore.collection('shithead').doc(player.value);
        var loserCount;

        playerRef.get().then(function(playerData) {
          if (playerData.exists) {
            if (player === loser) {
              playerRef.update({
                gamesPlayed: playerData.data().gamesPlayed + 1,
                shitheads: playerData.data().shitheads + 1
              })
            } else {
              playerRef.update({
                gamesPlayed: playerData.data().gamesPlayed + 1
              })
            }
          } else {
            (player === loser) ? loserCount = 1 : loserCount = 0;

            firestore.collection('shithead').doc(player.value).set({
              gamesPlayed: 1,
              name: player.label,
              shitheads: loserCount,
              uid: player.value
            }) 
          }
        }).catch(function(error) {
          console.log("error getting doc: ", error);
        });
      }
  })
}

  render() {
    return (
    <div className="row my-3">
      <Button className="mb-2" onClick={() => this.setState({open: !this.state.open})} aria-controls="newGame" aria-expanded={this.state.open}>Add new game?</Button>
      <Collapse in={this.state.open} className="w-100">
        <Card id="newGame">
          <Card.Header>
            <Card.Body>
              <h1 className="h3 font-weight-normal">Add new game</h1>
              <Form onSubmit={e => this.handleSubmit(e)}>
                <Form.Group controlId="players">
                  <Form.Label>Players</Form.Label>
                  <Select options={this.props.data} onChange={e => this.setState({players: e})} closeMenuOnSelect={false} isMulti components={animatedComponents} placeholder="Who was playing?"/>
                </Form.Group>
                <Form.Group controlId="loser">
                  <Form.Label>Shithead</Form.Label>
                  <Select options={this.props.data} onChange={e => this.setState({loser: e})} components={animatedComponents} placeholder="Who was the shithead?"/>
                </Form.Group>
                <Button type="submit">
                Submit
                </Button>
              </Form>
            </Card.Body>
          </Card.Header>
        </Card>
      </Collapse>
    </div>
    )}
}

export default App;
