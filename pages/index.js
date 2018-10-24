import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { getTransactions } from '../services/transactionService'
import styled from 'styled-components'
import Card, { CardHeader } from '../components/Card'
import Table from '../components/Table'
import Link from 'next/link'
import Icon from '../components/Icon'

const Container = styled.div`
  position: relative;
  max-width: 70%;
  margin: 0 auto;
  padding-top: 50px;
  h4 {
    display: inline-block;
  }
  table {
    text-align: left;
    a {
      display: block;
      width: 100%;
    }
    td > div,
    a {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    td:first-child,
    th:first-child {
      padding-left: 20px;
    }
    th:nth-child(4) {
      width: 50px;
    }
    td:nth-child(4) {
      text-align: center;
      padding: 0;
      vertical-align: middle;
    }
    td {
      vertical-align: middle;
    }
  }
`

const columns = [
  {
    key: 'tx',
    value: 'TX #'
  },
  {
    key: 'block',
    value: 'Block'
  },
  {
    key: 'from',
    value: 'From'
  },
  {
    key: 'arrow',
    value: ''
  },
  {
    key: 'to',
    value: 'To'
  },
  {
    key: 'amount',
    value: 'Value transacted'
  }
]
const AddressContainer = styled.div`
  a:first-child {
    margin-bottom: 5px;
  }
`

export default class HomePage extends Component {
  static propTypes = {
    txs: PropTypes.array
  }
  static async getInitialProps (context) {
    try {
      const { data, success, error } = await getTransactions()
      return { txs: data, success, error }
    } catch (error) {
      return { error: 'something is wrong!' }
    }
  }
  render () {
    return (
      <Container>
        <Card>
          <CardHeader>
            <h4>RECENT TRANSACTIONS : </h4> <span>showing latest 200 Records</span>
          </CardHeader>
          <Table
            columns={columns}
            dataSource={this.props.txs.map(tx => {
              return {
                key: tx.txid,
                tx: (
                  <Link as={`/transaction/${tx.txid}`} href={`/transaction?id=${tx.txid}`} prefetch>
                    <a>{tx.txid}</a>
                  </Link>
                ),
                block: tx.txblknum,
                from: (
                  <AddressContainer>
                    <Link as={`/address/${tx.spender1}`} href={`/address?id=${tx.spender1}`} prefetch>
                      <a>{tx.spender1}</a>
                    </Link>
                    <Link as={`/address/${tx.spender2}`} href={`/address?id=${tx.spender2}`} prefetch>
                      <a>{tx.spender2}</a>
                    </Link>
                  </AddressContainer>
                ),
                to: (
                  <AddressContainer>
                    <Link as={`/address/${tx.newowner1}`} href={`/address?id=${tx.newowner1}`} prefetch>
                      <a>{tx.newowner1}</a>
                    </Link>
                    <Link as={`/address/${tx.newowner2}`} href={`/address?id=${tx.newowner2}`} prefetch>
                      <a>{tx.newowner2}</a>
                    </Link>
                  </AddressContainer>
                ),
                amount: (
                  <div>
                    <div style={{ marginBottom: '5px' }}>
                      <span>{tx.amount1}</span> <span>ETH</span>
                    </div>
                    <div>
                      <span>{tx.amount2}</span> <span>ETH</span>
                    </div>
                  </div>
                ),
                arrow: <Icon name='Arrow-Long-Right' />
              }
            })}
          />
        </Card>
      </Container>
    )
  }
}
