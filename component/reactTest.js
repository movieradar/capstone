

        class Hello extends React.Component {
          
          constructor(props) {
              super(props);
              this.state = {
                checked: true
              };
          }

          handleChecked = () => {
            this.setState({checked: !this.state.checked});
          }

          render() {
              var msg;
              if(this.state.checked){
                msg = "checked!";
              } else {
                msg = "unchecked";
              }
              return(
                <div>
                  <input type = "checkbox" onChange={this.handleChecked} defaultChecked={this.state.checked} />
                  <h2>checked is {msg}</h2>
                </div>

              );          
          }
       }

       class Comments extends React.Component {

          constructor(props) {
              super(props);
              this.state = {
                editing: false
              };
          }

          edit = () =>{
            this.setState({editing: true});
          }

          save = () =>{
            var val = this.refs.newText.value;
            console.log("new comments log" + val);
            this.props.updateComment(val, this.props.index);
            this.setState({editing: false});
          }

          delete(){
            alert("This is delete");
            this.props.deleteFromBoard(this.props.index); 
          }

          renderNormal(){
            return (<div className = 'input_comment'>
                      <div>{this.props.children}</div>
                      <button onClick={this.edit}> Edit </button>
                      <button onClick={this.delete}> Deltete </button>
                    </div>
            );
          }

          renderForm() {
            return (<div className = 'input_comment'>
                      <textarea ref = "newText" defaultValue = {this.props.children}></textarea>
                      <button onClick={this.save}> Save </button>
                      
                    </div>
            );
          }

          render(){
            if(this.state.editing){
              return this.renderForm();
            } else {
              return this.renderNormal();
            }
          }
      }


      class Board extends React.Component {
        constructor(props) {
              super(props);
              this.removeComment = this.removeComment.bind(this);
              this.updateComment = this.updateComment.bind(this);
              this.state = {
                comments:[
                'I like bacon',
                'I like fish',
                'I like chips, engoht!'
              ]
            }
        }

        removeComment = (i) =>{
          console.log("removing comments " + i);
          var arr = this.state.comments;
          arr.splice(i, 1);
          this.setState({comments: arr});
        }

        updateComment = (newText, i) => {
          console.log("updateing comments " + i);
          var arr = this.state.comments;
          arr[i] = newText;
          this.setState({comments: arr});
        }

        eachComment(text,i){

              return(<Comments key={i} index={i} 
                
                  updateCommentText={this.updateComment}
                  deleteFromBoard={this.removeComment}
                  
                  >
                    {text}
                  </Comments>);
        }

        render(){
            return (
              <div>
                {
                  this.state.comments.map(this.eachComment)
                }
              </div>
            )
        }
      }

      