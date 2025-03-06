import React from 'react';
import PropTypes from 'prop-types';
import { Routes, Route } from 'react-router-dom';
import ScheduleView from '../components/ScheduleView';
import KeyEventsView from '../components/KeyEventsView';
import SheetsExplorer from '../components/SheetsExplorer';
import PartnerConfig from '../components/PartnerConfig';
import LandingPagesView from '../components/LandingPagesView';
import FuboMatches from '../components/FuboMatches';
import MoviesView from '../components/MoviesView';
import SeriesView from '../components/SeriesView';

/**
 * Component that defines all application routes
 * @param {Object} props Component props
 * @param {Array} props.sportsData Sports data from API
 * @param {Array} props.moviesData Movies data from API
 * @param {Array} props.seriesData Series data from API
 * @param {boolean} props.loading Loading state
 * @param {Object} props.error Error state
 * @returns {JSX.Element} Routes component
 */
const AppRoutes = ({ sportsData, moviesData, seriesData, loading, error }) => {
  return (
    <Routes>
      {/* Home route */}
      <Route
        path="/"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            title="All Sports on Fubo"
          />
        }
      />

      {/* Main navigation routes */}
      <Route path="/key-events" element={<KeyEventsView />} />
      <Route path="/sheets-explorer" element={<SheetsExplorer />} />
      <Route path="/landing-pages" element={<LandingPagesView />} />

      {/* Movies routes */}
      <Route
        path="/movies"
        element={
          <MoviesView data={moviesData} loading={loading} error={error} title="Movies on Fubo" />
        }
      />
      <Route
        path="/movies/action"
        element={
          <MoviesView
            data={moviesData}
            loading={loading}
            error={error}
            filter={{ genre: 'action' }}
            title="Action Movies on Fubo"
          />
        }
      />
      <Route
        path="/movies/comedy"
        element={
          <MoviesView
            data={moviesData}
            loading={loading}
            error={error}
            filter={{ genre: 'comedy' }}
            title="Comedy Movies on Fubo"
          />
        }
      />
      <Route
        path="/movies/drama"
        element={
          <MoviesView
            data={moviesData}
            loading={loading}
            error={error}
            filter={{ genre: 'drama' }}
            title="Drama Movies on Fubo"
          />
        }
      />
      <Route
        path="/movies/family"
        element={
          <MoviesView
            data={moviesData}
            loading={loading}
            error={error}
            filter={{ genre: 'family' }}
            title="Family Movies on Fubo"
          />
        }
      />

      {/* Series routes */}
      <Route
        path="/series"
        element={
          <SeriesView data={seriesData} loading={loading} error={error} title="TV Series on Fubo" />
        }
      />
      <Route
        path="/series/action"
        element={
          <SeriesView
            data={seriesData}
            loading={loading}
            error={error}
            filter={{ genre: 'action' }}
            title="Action Series on Fubo"
          />
        }
      />
      <Route
        path="/series/comedy"
        element={
          <SeriesView
            data={seriesData}
            loading={loading}
            error={error}
            filter={{ genre: 'comedy' }}
            title="Comedy Series on Fubo"
          />
        }
      />

      {/* Sport-specific routes */}
      <Route
        path="/sport/soccer"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'soccer' }}
            title="Soccer on Fubo"
          />
        }
      />
      <Route
        path="/sport/nfl"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'football' }}
            title="NFL on Fubo"
          />
        }
      />
      <Route
        path="/sport/nba"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'basketball' }}
            title="NBA & WNBA on Fubo"
          />
        }
      />
      <Route
        path="/sport/nhl"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'hockey' }}
            title="NHL on Fubo"
          />
        }
      />
      <Route
        path="/sport/college-basketball"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'college-basketball' }}
            title="College Basketball on Fubo"
          />
        }
      />
      <Route
        path="/sport/college-football"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'college-football' }}
            title="College Football on Fubo"
          />
        }
      />
      <Route
        path="/sport/golf"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'golf' }}
            title="Golf on Fubo"
          />
        }
      />
      <Route
        path="/sport/tennis"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'tennis' }}
            title="Tennis on Fubo"
          />
        }
      />
      <Route
        path="/sport/motorsports"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'motorsports' }}
            title="Motorsports on Fubo"
          />
        }
      />
      <Route
        path="/sport/baseball"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'sport', value: 'baseball' }}
            title="Baseball on Fubo"
          />
        }
      />

      {/* Latino content routes */}
      <Route
        path="/latino-sports"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'latino', value: 'sports' }}
            title="Latino Sports on Fubo"
          />
        }
      />
      <Route
        path="/latino-entertainment"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'latino', value: 'entertainment' }}
            title="Latino Entertainment on Fubo"
          />
        }
      />

      {/* Legacy routes */}
      <Route
        path="/local"
        element={
          <ScheduleView
            data={sportsData}
            loading={loading}
            error={error}
            filter={{ type: 'regional', value: true }}
            title="Local Sports on Fubo"
          />
        }
      />

      {/* Configuration */}
      <Route path="/partner-config" element={<PartnerConfig />} />
      <Route path="/fubo-matches" element={<FuboMatches />} />
    </Routes>
  );
};

AppRoutes.propTypes = {
  sportsData: PropTypes.array,
  moviesData: PropTypes.array,
  seriesData: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default AppRoutes;
