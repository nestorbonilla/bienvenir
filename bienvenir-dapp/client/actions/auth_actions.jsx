import { AsyncStorage} from 'react-native'

import {
    CELO_LOGIN_SUCCESS,
    CELO_LOGIN_FAIL
} from './types'

import '../global'
import { web3, kit } from '../root'
import {   
    requestTxSig,
    waitForSignedTxs,
    requestAccountAddress,
    waitForAccountAuth,
    FeeCurrency
} from '@celo/dappkit'
import { CeloContract } from '@celo/contractkit'
import { toTxResult } from '@celo/contractkit/lib/utils/tx-result'
import { Linking } from 'expo'
import HelloWorldContract from '../contracts/HelloWorld.json'

// How to use AsyncStorage
// AsyncStorage.setItem('cl_token', token)
// AsyncStorage.getItem('cl_token')

export const celoLogin = () => async dispatch => {
    let address = await AsyncStorage.getItem('cl_address')
    if(address) {
        //Celo Login is done
        dispatch({ type: CELO_LOGIN_SUCCESS, payload: address })
    } else {
        //Lauch Celo call to Login
        doCeloLogin()
    }
}

const doCeloLogin = async () => {

    const requestId = 'login'
    const dappName = 'Hello Celo'
    const callback = Linking.makeUrl('/my/path')
  
    requestAccountAddress({
      requestId,
      dappName,
      callback,
    })
  
    const dappkitResponse = await waitForAccountAuth(requestId)

    kit.defaultAccount = dappkitResponse.address

    const stableToken = await kit.contracts.getStableToken()

    const [cUSDBalanceBig, cUSDDecimals] = await Promise.all([stableToken.balanceOf(kit.defaultAccount), stableToken.decimals()])
    let cUSDBalance = cUSDBalanceBig.toString()
    //this.setState({ cUSDBalance, isLoadingBalance: false })
    //this.setState({ address: dappkitResponse.address, phoneNumber: dappkitResponse.phoneNumber })
    if (cUSDBalance === '') {
        return dispatch({ type: CELO_LOGIN_FAIL })
    } else {
        await AsyncStorage.setItem('cl_address', dappkitResponse.address)
        //await AsyncStorage.setItem('cl_phone', dappkitResponse.phoneNumber)
        await AsyncStorage.setItem('cl_balance', cUSDBalance)
        
        dispatch({ type: CELO_LOGIN_SUCCESS, payload: cUSDBalance })
    }
        
}