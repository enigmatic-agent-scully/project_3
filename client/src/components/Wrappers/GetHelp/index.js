import React, { Component } from 'react';
import { Col, Row, Card } from 'react-materialize';
import NeedInput from '../../Tools/NeedInput';
import NeedList from '../../Tools/NeedList';
// import ResolvedList from '../../Tools/ResolvedList';
import './style.css';
import { uploadFile } from 'react-s3';
import API from '../../../utils/API';
import { config } from '../../../config/Config';
// import { timingSafeEqual } from 'crypto';

class GetHelp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: '0',
      subject: '',
      needdate: '',
      address: '',
      description: '',
      imageurl: '',
      lat: '',
      lng: '',
      needs: [],
      isModalOpen: false,
      clearGeoSuggest: false
    };

    this.reactS3config = {
      bucketName: 'gooddeedsimages',
      region: 'us-east-1',
      accessKeyId: config.awsKey,
      secretAccessKey: config.awsSecret
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadNeeds = this.loadNeeds.bind(this);
    this.uploadHandler = this.uploadHandler.bind(this);
    this.handleGeoCode = this.handleGeoCode.bind(this);
    this.SubmitHandler = this.SubmitHandler.bind(this);
    this.markResolved = this.markResolved.bind(this);
    this.markUnresolved = this.markUnresolved.bind(this);
    this.deleteNeed = this.deleteNeed.bind(this);

    this.loadNeeds();
  }

  handleGeoCode(suggest) {
    console.log(suggest);
    if (suggest) {
      this.setState({
        lat: suggest.location.lat,
        lng: suggest.location.lng,
        address: suggest.location.description
      });
    }
  }

  markResolved(needId) {
    API.markResolved(needId)
      .then(this.loadNeeds())
      .catch(err => console.log(err));
  }

  markUnresolved(needId) {
    API.markUnresolved(needId)
      .then(this.loadNeeds())
      .catch(err => console.log(err));
  }

  deleteNeed(needId) {
    console.log(needId);
    API.deleteNeed(needId)
      .then(this.loadNeeds())
      .catch(err => console.log(err));
  }
  onHoverEvent(id) {
    // console.log(id);
  }

  handleCloseModal() {
    this.setState({
      isModalOpen: false
    });
  }

  loadNeeds() {
    API.getNeedsCurrentUser()
      .then(res =>
        this.setState({
          category: '0',
          subject: '',
          description: '',
          needdate: '',
          needs: res.data
        })
      )
      .catch(err => console.log(err));
    this.handleCloseModal();
  }

  handleClearGeoSuggest() {
    this.setState({
      clearGeoSuggest: true
    });
  }

  uploadHandler(event) {
    const imagefile = event.target.files[0];
    uploadFile(imagefile, this.reactS3config)
      .then(data => {
        this.setState({ imageurl: data.location });
      })
      .catch(err => console.error(err));
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }

  SubmitHandler(event) {
    event.preventDefault();
    const NeedInfo = this.state;
    API.postNeed({
      category: NeedInfo.category,
      subject: NeedInfo.subject,
      needdate: NeedInfo.needdate,
      description: NeedInfo.description,
      imageurl: NeedInfo.imageurl,
      lat: NeedInfo.lat,
      lng: NeedInfo.lng,
      user: this.props.user._id
    }).then(this.loadNeeds());
  }

  render() {
    return (
      <div className='Get-Help-Wrapper'>
        <Row>
          <Col s={12} m={4}>
            <NeedInput
              subject={this.state.subject}
              imagefile={this.state.imagefile}
              category={this.state.category}
              address={this.state.address}
              needdate={this.state.needdate}
              description={this.state.description}
              imageurl={this.state.imageurl}
              uploadHandler={this.uploadHandler}
              handleInputChange={this.handleInputChange}
              SubmitHandler={this.SubmitHandler}
              handleGeoCode={this.handleGeoCode}
              clearGeoSuggest={this.state.clearGeoSuggest}
            />
          </Col>
          <Col id='need-list' s={12} m={4}>
            <Card>
              <h4>List of Needs</h4>
              <NeedList
                deleteNeed={this.deleteNeed}
                currentUserID={this.props.user._id}
                isModalOpen={this.state.isModalOpen}
                markResolved={this.markResolved}
                onHoverEvent={this.onHoverEvent}
                needs={this.state.needs.filter(need => !need.resolved)}
              />
            </Card>
          </Col>
          <Col id='need-list' s={12} m={4}>
            <Card>
              <h4>Resolved Needs</h4>
              <NeedList
                deleteNeed={this.deleteNeed}
                currentUserID={this.props.user._id}
                isModalOpen={this.state.isModalOpen}
                markUnresolved={this.markUnresolved}
                onHoverEvent={this.onHoverEvent}
                needs={this.state.needs.filter(need => need.resolved)}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default GetHelp;
