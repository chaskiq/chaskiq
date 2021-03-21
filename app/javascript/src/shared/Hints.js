
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
          //variant="shadowless"
          classes="text-yellow-900 shadow-sm bg-white bg-yellow-200 md:rounded-md sm:rounded-sm"
        />
      </div>
    }
  </React.Fragment>
}

export default Hints
