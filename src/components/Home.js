import React from 'react';
import {useSelector} from 'react-redux';

function Home({ history }) {
  const user = useSelector(state => state.user);
    return (
        <div className="full-height home" style={{fontSize: '1.5em', textAlign: 'center', position: 'relative', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
            <div className="container vertical-center">
              {user.logged ? (
                <span className="welcome">Welcome {user.name}</span>
              ) : (
                <>
                  <span>Welcome stranger!</span>
                  <br/><br/>
                  <span>Please consult with your management department<br/>about your account information<br/>if you don't already have them.</span>
                </>
              )}

            </div>
        </div>
    )
}

export default Home;
