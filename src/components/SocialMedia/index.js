import {
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
  FiSlack,
} from 'react-icons/fi'
import cn from 'classnames'
import AppLink from '../AppLink'


const socialMedia = [
  {
    Icon: FiTwitter,
    url: 'https://twitter.com/cosmicjs',
  },
  {
    Icon: FiFacebook,
    url: 'https://www.facebook.com/cosmicjs',
  },
  {
    Icon: FiLinkedin,
    url: 'https://www.linkedin.com/company/cosmicjs/',
  },
  {
    Icon: FiYoutube,
    url: 'https://www.youtube.com/cosmicjs',
  },
  {
    Icon: FiSlack,
    url: 'https://cosmcijs.slack.com',
  },
]

const SocialMedia = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-5", className)}>
      {socialMedia?.map(({ Icon, url }, index) => (
        <AppLink 
          key={index} 
          target="_blank" 
          href={url}
          className="hover:opacity-70 transition-opacity"
        >
          <Icon size="20" />
        </AppLink>
      ))}
    </div>
  )
}


export default SocialMedia

