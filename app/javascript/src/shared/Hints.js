
import React from 'react'
import Panel from '../components/Panel'
import I18n from '../shared/FakeI18n'

const Hints = ({ type }) => {
  const content = I18n.t('hints')[type]

  return <React.Fragment>
    {
      content && <div className="py-2 pb-6">
        <Panel
          title={content.title}
          text={content.description}
          link={content.link}
          variant="shadowless"
          classes="bg-white border border-1 border-gray-400 sm:rounded-lg bg-yellow-50"
        />
      </div>
    }
  </React.Fragment>
}

export default Hints
