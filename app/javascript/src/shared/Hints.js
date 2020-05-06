
import React from 'react'
import Panel from '../components/Panel'

const hints = {
  Platform: {
    title: 'Here you can manage your contact list via segments',
    description: 'Segments allows to filter specific contacts through multiple filters',
    //link: {  href: '/', title: 'Learn how filters works on our knowledge base'}
  },
  Webhooks: {
    title: 'Active Webhooks',
    description: "Webhooks feature it\'s all about delivering notifications of chaskiq events",
    //link: { href: '/', text: 'Learn how webhooks works on our knowledge base'}
  },
  Integrations: {
    title: null,
    description: 'This is the third party API integrations section.',
    //link: { href: '/',text: 'Learn how API integrations works on Chaskiq from the inside out'}
  },
  Team: {},
  AppConfig: {},
  Security: {
    title: 'Security',
    description: 'This is the encryption key to identify registered users on your service',
    //link: { href: '/', text: 'Learn how Encryption & security settings works on Chaskiq'}
  },
  Appearance: {},
  Languages: {},
  Availability: {
    title: 'Team Availability Settings',
    description: 'Availability settings let your team set office hours & reply times.',
    //link: {href: '/', text: 'Learn how Availability settings works on Chaskiq'}
  },
  EmailRequirement: {
    title: 'Require an email for new conversations',
    description: 'So you can always get back to your website visitors',
    //link: {href: '/',text: 'Learn how Email requirement works on Chaskiq'}
  },
  InboundSettings: {
    title: 'Control inbound conversations and the launcher',
    description: 'Control who can send you messages and where they see the launcher',
    //link: { href: '/',text: 'Learn how Inbound settings works on Chaskiq'}
  },
  UserData: {
    title: 'Manage user attributes',
    description: 'User attributes provides a way to customize data for segment filtering',
    //link: {href: '/', text: 'Learn how segments work on Chaskiq'}
  },
  Articles: {
    title: 'Chaskiq HelpCenter platform',
    description: 'Here you can manage the articles of Chaskiq',
    //link: { href: '/', text: 'Learn how to configure & manage the helpcenter system on Chaskiq'}
  },
  Bots: {},
  MailingCampaigns: {},
  InApp: {},
  GuidedTours: {}
}

const Hints = ({ type }) => {
  const content = hints[type]

  return <React.Fragment>
    {
      content && <div className="py-2 pb-6">
        <Panel
          title={content.title}
          text={content.description}
          link={content.link}
          variant="shadowless"
          classes="border"
        />
      </div>
    }
  </React.Fragment>
}

export default Hints
