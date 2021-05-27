import Vue from 'vue'
import Vuex from 'vuex'
import { auth, firestore, googleProvider, firebase } from './config/firebaseConfig'
import uuidv4 from 'uuid'
import emailjs from 'emailjs-com';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    'uid': null,
    'username': '',
    'initials': '',
    'email': '',
    'submitting': false,
    'boards': [],
    'board': {},
    'activeId': '',
    'lists': [],
    boardsListener: undefined,
    boardListener: undefined,
    listListener: undefined
  },
  mutations: {
    setUid(state, uid){
      state.uid = uid;
    },
    setUsername(state, username){
      state.username = username
    },
    setInitials(state, initials){
      state.initials = initials;
    },
    setEmail(state, value){
      state.email = value;
    },
    setSubmitting(state, value){
      state.submitting = value
    },
    reset(state){
      state.uid = null
      state.username = ''
      state.email = ''
      state.initials = ''
      state.submitting = false
      state.boards = []
      state.board = {}
      state.activeId = ''
      state.boardListener()
      state.boardListener()
      state.listListener()
    },
    addBoards(state, boards){
      state.boards = boards
    },
    setBoardListener(state, listener){
      state.boardListener = listener
    },
    setBoardsListener(state, listener){
      state.boardsListener = listener
    },
    setActiveId(state, id){
      state.activeId = id
    },
    addLists(state, lists){
      state.lists = lists;
    },
    setListListener(state, listener){
      state.listListener = listener
    },
    activeBoard(state, board) {
      state.board = board
    }
  },
  actions: {
    emailSignUp({commit}, {name, email, password}){
      commit('setSubmitting', true);
      return new Promise((resolve, reject) => {
        auth.createUserWithEmailAndPassword(email, password)
          .then(result => {
            result.user.updateProfile({
              displayName: name
            });
            alert("ADD NAME");

            let uid = result.user.uid;
            let initials = ['', ...name.split(' ')]
              .reduce((accumulator, currentValue) => accumulator + currentValue[0])
            firestore.collection('users').doc(uid).set({
              name,
              initials,
              email
            })
        })
          .then((res) => {
            commit('setSubmitting', false);
            resolve(res)
          })
          .catch(function(error) {
            commit('setSubmitting', false);
            reject(error.message);
          });
      });
    },
    emailSignIn({commit}, {email, password}){
      commit('setSubmitting', true);
      return new Promise((resolve, reject) => {
        auth.signInWithEmailAndPassword(email, password)
          .then((res) => {
            commit('setSubmitting', false);
            resolve(res)
          })
          .catch(function(error) {
            commit('setSubmitting', false);
            reject(error.message)
        });
      })
    },
    googleOAuth(){
      return new Promise((resolve, reject) => {
        auth.signInWithPopup(googleProvider)
          .then((result) => {
            let name = result.additionalUserInfo.profile.name;
            //extracting max two word initials from name
            let initials = ['', ...name.split(' ')].reduce((accumulator, currentValue) => accumulator + currentValue[0]).substring(0,2)
            if(result.additionalUserInfo.isNewUser){
              firestore.collection('users').doc(result.user.uid).set({
                name,
                initials,
                email
              });
            }
            resolve();
          })
          .catch(function(error) {
          reject(error.message)
        });
      })
    },
    signOut({ commit }) {
      return new Promise((resolve, reject) => {
        auth.signOut().then(function() {
          resolve('success')
          commit('reset');
        }).catch(function(error) {
          reject(error)
        });
      })
    },
    checkIsAuthenticated({commit, dispatch}) {
      return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(function(user) {
          if (user) {
            let uid = user.uid;
            let username = user.displayName;
            commit('setUid', uid);
            commit('setUsername', username);
            dispatch('fetchUserInfo', uid);
            localStorage.setItem('authUser', JSON.stringify({authenticated : true}));
            resolve()
          } else {
            localStorage.removeItem('authUser');
            reject('User Not authenticated')
          }
        });
      })
    },
    getBoards({ dispatch }) {
      dispatch('fetchBoards')
    },
    async inviteUserInBoard(context, {email, boardId}) {
      let board = await firestore.collection('boards').doc(boardId).get();
      let invited = board.data().invited;

      await firestore.collection('users')
        .where("email", "==", email)
        .onSnapshot(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            if (doc.data().email == email) {
              let userId = doc.id;
              console.log("............doc.data().name = ", doc.data().name);
              let userName = doc.data().name;
              invited.push( { id: userId, name: userName } );
              
              firestore.collection('boards').doc(boardId).update({
                invited: invited
              })

              console.log("UPDATED");
            }
        });
      });
    },
    async sendInvite(context, {email, boardId}) {
      let board = await firestore.collection('boards').doc(boardId).get();
      let boardName = board.data().name;
      let msg = "Hello! You was invited to board " + boardName + ".\n" 
            + "You can visit board: http://localhost:8080/board/" + boardId;
      let params = {
        name: "User",
        email: email,
        message: msg,
        from_name: "Planner"
      };

      emailjs.send('Planner', 'template_k7zgz4n', params, 'user_CmY4NXYyWpu88LAwNkwUi')
        .then((result) => {
            console.log('SUCCESS!', result.status, result.text);
            alert("Invite was send");
        }, (error) => {
            console.log('FAILED...', error);
      });
    },
    async leaveBoard({ state }, boardId) {
      let userId = state.uid;
      let board = await firestore.collection('boards').doc(boardId).get();
      let avblTo = board.data().availableTo;

      let indx = avblTo.findIndex(obj => {
        return obj.id === state.uid
      });
      if (indx > -1) {
        avblTo.splice(indx, 1);
        console.log("removed");
      } else {
        console.log("not found");
      }

      firestore.collection('boards').doc(boardId).update({
        availableTo: avblTo
      })
    },
    createBoard({ state }, name) {
      return new Promise((resolve, reject) => {
        firestore.collection('boards').add({
          name,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          lists: [],
          createdBy: { id: state.uid, name: state.username },
          availableTo: [ { id: state.uid, name: state.username } ],
          invited: []
        }).then(() => {
          resolve('added')
        }).catch(err => {
          reject(err)
        })
      });
    },
    async fetchUserInfo({ commit }, uid) {
      try{
        let user = await firestore.collection('users').doc(uid).get();
        let data = user.data();
        commit('setInitials', data.initials.substring(0,2));
        commit('setUsername', data.name);
        
      }catch(err){
        console.log(err)
      }
    },
    fetchBoards({ state, commit }) {
      let boardsListener = firestore.collection('boards')
        .orderBy("updatedAt", "desc")
        .onSnapshot(function(querySnapshot) {
          let boards = [];
          querySnapshot.forEach(function(doc) {
            let indx = doc.data().availableTo.findIndex(obj => {
              return obj.id === state.uid
            });
            if (indx > -1) {
              boards.push({
                id: doc.id,
                name: doc.data().name,
                createdBy: doc.data().createdBy,
                users: doc.data().availableTo
              });
              console.log("added: ", doc.id);
            }
          });
          commit('addBoards', boards)
        });
      commit('setBoardsListener', boardsListener)
    },
    async currentBoard({commit}, boardId){
      try{
        let boardListener = await firestore.collection('boards').doc(boardId)
          .onSnapshot(function(doc) {
          commit('activeBoard', doc.data())
        });
        commit('setBoardListener', boardListener)
      }catch (e) {
        console.log(e)
      }
    },
    async updateBoard(context, {boardId, newLists}){
      try{
        await firestore.collection('boards').doc(boardId).update({
          lists: newLists,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      }catch(e){
        console.log(e)
      }
    },
    addList(context, {title, boardId}){
      return new Promise((resolve, reject) => {
        firestore.collection('lists').add({
          title,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          cards: [],
          boardId
        }).then((res) => {
          return firestore.collection('boards').doc(boardId).update({
            lists: firebase.firestore.FieldValue.arrayUnion(res.id),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          })
        }).then(() => {
          resolve('added')
        }).catch(err => {
          reject(err)
        })
      });
    },
    async checkInvited({ state }, boardId) {
      let board = await firestore.collection('boards').doc(boardId).get();
      let avblTo = board.data().availableTo;
      let invited = board.data().invited;

      let user = invited.find(obj => {
        return obj.id === state.uid
      });
      let indx = invited.findIndex(obj => {
        return obj.id === state.uid
      });
      if (indx > -1) {
        // user was invited to this board
        // move him to availableTo

        invited.splice(indx, 1);
        avblTo.push( user );
              
        await firestore.collection('boards').doc(boardId).update({
          availableTo: avblTo,
          invited: invited
        })

        console.log("user is invited to this board");
      }
    },
    fetchLists({ commit }, boardId) {
      let listListener = firestore.collection('lists')
        .where("boardId", "==", boardId)
        .onSnapshot(function(querySnapshot) {
          let lists = [];
          querySnapshot.forEach(function(doc) {
            lists.push({
              id: doc.id,
              ...doc.data()
            });
          });
          commit('addLists', lists)
        });
      commit('setListListener', listListener)
    },
    async deleteList(context, {listId, boardId}) {
      try{
        await firestore.collection('boards').doc(boardId).update({
          lists: firebase.firestore.FieldValue.arrayRemove(listId),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        await firestore.collection('lists').doc(listId).delete()
      } catch (e) {
        console.log(e)
      }
    },
    addCard(context, {listId, data}){
      firestore.collection('lists').doc(listId)
        .update({
          cards: firebase.firestore.FieldValue.arrayUnion({
            id: uuidv4(),
            info: data
          }),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => console.log('card added'))
        .catch((err) => console.log(err))
    },
    updateCard(context, {listId, cards}){
      firestore.collection('lists').doc(listId)
        .update({
          cards,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => console.log('card updated'))
        .catch((err) => console.log(err))
    },
    async deleteBoard(context, {boardId}) {
      try{
        firestore.collection('lists')
        .where("boardId", "==", boardId)
        .onSnapshot(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            firestore.collection('lists').doc(doc.id).delete();
          });
        });

        await firestore.collection('boards').doc(boardId).delete()
      } catch (e) {
        console.log(e, "       <", boardId)
      }      
    }
  },
  getters: {
    orderedList: state => {
      if(state.board.lists && state.lists.length>0){
        return state.board.lists.map(id => {
          for(let list of state.lists){
            if(list && list.id === id){
              return list
            }
          }
        })
      }
    },
    boardUsers: state => (boardId) => {
      console.log("Called");

      for(let board of state.boards){
        if(board.id  === boardId){
          console.log("==============> boardUsers");
          console.log(board.users[0]);
          return board.users;
        }
      }
    },
    isBoardCreator: state => (boardId) => {
      for(let board of state.boards){
        if(board.id  === boardId){
          if (board.createdBy.id === state.uid) {
            console.log("Creator");
            return true;
          } else {
            console.log("Invited user");
            return false;
          }  
        }
      }
      console.log("error");
    },
    isAlailableTo: state => (boardId) => {
      for(let board of state.boards){
        console.log("board: ", board.id);
        if(board.id  === boardId){
          console.log("board is in list");
          return true;  
        }
      }

      console.log("board not found");
      return false;
    }
  }
})

export default store;